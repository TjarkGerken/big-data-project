from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType

dbUrl = 'jdbc:mysql://root:mysecretpw@my-app-mariadb-service:3306/spotify'
dbOptions = {"user": "root", "password": "mysecretpw"}
dbTableSongs = 'top_songs'
dbTableArtists = 'top_artists'
dbTableUsers = 'users'  # Add <the users table

windowDuration = '7 days'
slidingDuration = '7 days'

# Create a spark session
spark = SparkSession.builder \
    .appName("Spotify Wrapped") \
    .getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "spotify-track-data") \
    .option("startingOffsets", "earliest") \
    .load()

# Define schema of tracking data
messageSchema = StructType() \
    .add("endTime", StringType()) \
    .add("artistName", StringType()) \
    .add("trackName", StringType()) \
    .add("UID", StringType()) \
    .add("msPlayed", IntegerType())

# Convert value: binary -> JSON -> fields + parsed timestamp
parsedMessages = kafkaMessages.select(
    from_json(
        column("value").cast("string"),
        messageSchema
    ).alias("json")
).select(
    to_timestamp(column('json.endTime'), "yyyy-MM-dd HH:mm").alias("parsed_timestamp"),
    column("json.*")
)

# Add watermark for handling late data
parsedMessages = parsedMessages.withWatermark("parsed_timestamp", windowDuration)

# Compute most popular tracks
popularTracks = parsedMessages.groupBy(
    window(col("parsed_timestamp"), windowDuration, slidingDuration),
    col("trackName"),
    col("artistName"),
    col("UID")
).agg(
    sum("msPlayed").alias("total_msPlayed")
).select(
    col("trackName"),
    col("artistName"),
    col("UID").alias("spotify_user_id"),
    col("total_msPlayed")
)

# Start running the query; print running counts to the console without sorting
consoleDump = popularTracks \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

def saveToDatabase(batchDataframe, batchId):
    global dbUrl, dbTableSongs, dbTableArtists, dbTableUsers, dbOptions
    print(f"Writing batchID {batchId} to database @ {dbUrl}")
    
    # Read the current users from the database
    usersDf = spark.read \
        .format("jdbc") \
        .option("url", dbUrl) \
        .option("dbtable", dbTableUsers) \
        .load()
    
    # Select distinct users from the batch
    newUsersDf = batchDataframe.select("spotify_user_id").distinct()
    
    # Find users that are not in the current users DataFrame
    usersToAddDf = newUsersDf.join(usersDf, "spotify_user_id", "left_anti")
    
    # Write new users to the database
    if usersToAddDf.count() > 0:
        usersToAddDf.write \
            .format("jdbc") \
            .option("url", dbUrl) \
            .option("dbtable", dbTableUsers) \
            .mode("append") \
            .save()
    
    # Write top songs
    batchDataframe \
        .select("spotify_user_id", "trackName", "total_msPlayed") \
        .withColumnRenamed("trackName", "song_name") \
        .withColumnRenamed("total_msPlayed", "ms_played") \
        .write \
        .format("jdbc") \
        .option("url", dbUrl) \
        .option("dbtable", dbTableSongs) \
        .mode("append") \
        .save()
    
    # Write top artists
    batchDataframe \
        .select("spotify_user_id", "artistName", "total_msPlayed") \
        .withColumnRenamed("artistName", "artist_name") \
        .withColumnRenamed("total_msPlayed", "ms_played") \
        .write \
        .format("jdbc") \
        .option("url", dbUrl) \
        .option("dbtable", dbTableArtists) \
        .mode("append") \
        .save()

# Sort the popular tracks in complete mode before writing to database
sortedPopularTracks = popularTracks.orderBy(desc("total_msPlayed"))

dbInsertStream = sortedPopularTracks \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabase) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
