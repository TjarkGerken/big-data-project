from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import StructType, IntegerType, StringType, TimestampType

windowDuration = '7 days'
slidingDuration = '7 days'

mongo_uri = "mongodb://admin:password@mongodb:27017"
mongo_db = "spotify"

# create a spark session
spark = SparkSession \
    .builder \
    .master("local") \
    .appName("Spotify Wrapped") \
    .config("spark.mongodb.read.connection.uri", "mongodb://admin:password@mongodb:27017/spotify?authSource=admin") \
    .config("spark.mongodb.write.connection.uri", "mongodb://admin:password@mongodb:27017/spotify?authSource=admin") \
    .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector:10.0.2') \
    .getOrCreate()

spark.conf.set("spark.sql.streaming.checkpointLocation", "/tmp/checkpoints")

"""spark.mongodb.write.connection.uri=mongodb://127.0.0.1/
spark.mongodb.write.database=myDB
spark.mongodb.write.collection=myCollection
spark.mongodb.write.convertJson=any

spark.mongodb.write.connection.uri = "mongodb://127.0.0.1/myDB.myCollection?convertJson=any"
"""

messageSchema = StructType() \
    .add("endTime", StringType()) \
    .add("artistName", StringType()) \
    .add("trackName", StringType()) \
    .add("UID", StringType()) \
    .add("msPlayed", IntegerType())

spark.sparkContext.setLogLevel('WARN')

# Example Part 2
# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers",
            "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "spotify-track-data") \
    .option("startingOffsets", "earliest") \
    .load()

# Parse the Kafka messages using the provided schema
# Convert value: binary -> JSON -> fields + parsed timestamp
parsedMessages = kafkaMessages.select(
    # Extract 'value' from Kafka message (i.e., the tracking data)
    from_json(
        column("value").cast("string"),
        messageSchema
    ).alias("json")
).select(
    # Convert Unix timestamp to TimestampType
    to_timestamp(column('json.endTime'), "yyyy-MM-dd HH:mm")
    .cast(TimestampType())
    .alias("parsed_timestamp"),
    # Select all JSON fields
    column("json.*")
) \
    .withColumnRenamed('json.trackName', 'trackName') \
    .withColumnRenamed('json.UID', 'UID') \
 \
# .withWatermark("parsed_timestamp", windowDuration)

watermarkedMessages = parsedMessages.withWatermark("parsed_timestamp", "1 year")

# Compute most popular tracks
"""popularTracks = watermarkedMessages.groupBy(
    column("trackName"),
    column("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
) \
    .withColumnRenamed('window.start', 'window_start') \
    .withColumnRenamed('window.end', 'window_end') \
    .orderBy(desc("total_msPlayed")) \
    # .limit(20)
"""

popularTracks = watermarkedMessages.groupBy(
    "trackName", "UID"
).agg(
    sum("msPlayed").alias("total_msPlayed")
)

popularTracksWindow = parsedMessages.groupBy(
    window(
        col("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    col("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
) \
    .withColumnRenamed('window.start', 'window_start') \
    .withColumnRenamed('window.end', 'window_end')

popularArtist = parsedMessages.groupBy(
    col("artistName"),
    col("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
) \
    .withColumnRenamed('window.start', 'window_start') \
    .withColumnRenamed('window.end', 'window_end') \
    .orderBy(desc("total_msPlayed")) \
    .limit(20)

totalPlayedByUser = parsedMessages.groupBy(
    column("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
)

"""mongoDumbPopularTracks = popularTracks.writeStream \
    .format("mongodb") \
    .option("spark.mongodb.connection.uri", "mongodb://admin:password@mongodb:27017") \
    .option("spark.mongodb.database", "spotify") \
    .option("spark.mongodb.collection", "popularTracks") \
    .option("spark.mongodb.change.stream.publish.full.document.only", "true") \
    .option("forceDeleteTempCheckpointLocation", "true") \
    .option("checkpointLocation", "/tmp/mycheckpoint") \
    .outputMode("update") \
    .trigger(processingTime="1 second") \
    .start() \
    .awaitTermination()"""


debugQuery = popularTracks \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start() \
    .awaitTermination()

#.option("spark.mongodb.output.uri", "mongodb://admin:password@mongodb:27017/spotify.popularTracks") \
#.outputMode("update") \
#.start()

# .option("checkpointLocation", "/path/to/checkpoint/dir") \



consoleDumpTotalPlayed = totalPlayedByUser \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

"""
consoleDumpPopularTracks = popularTracks \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

consoleDumpOPopularTracksWindow = popularTracksWindow \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

consoleDumpPopularArtist = popularArtist \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

consoleDumpTotalPlayed.awaitTermination()
consoleDumpPopularTracks.awaitTermination()
consoleDumpOPopularTracksWindow.awaitTermination()
consoleDumpPopularArtist.awaitTermination()
"""
