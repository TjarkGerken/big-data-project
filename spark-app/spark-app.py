from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import StructType, IntegerType, StringType, TimestampType

windowDuration = '20 day'
slidingDuration = '20 day'


mongo_uri = "mongodb://admin:password@mongodb:27017"
mongo_db = "spotify"
mongo_collection = "track_data"

# create a spark session
spark = SparkSession \
    .builder \
    .master("local") \
    .appName("Spotify Wrapped") \
    .config("spark.mongodb.read.connection.uri", "mongodb://admin:password@mongodb:27017/spotify?authSource=admin") \
    .config("spark.mongodb.write.connection.uri", "mongodb://admin:password@mongodb:27017/spotify?authSource=admin") \
    .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector:10.0.2') \
    .getOrCreate()

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
    .withWatermark("parsed_timestamp", windowDuration)

"""window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),"""

# Compute most popular tracks
popularTracks = parsedMessages.groupBy(
    column("trackName"),
    column("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
) \
    .withColumnRenamed('window.start', 'window_start') \
    .withColumnRenamed('window.end', 'window_end') \
    .orderBy(desc("total_msPlayed")) \
    .limit(20)

popularArtist = parsedMessages.groupBy(
    column("artistName"),
    column("UID"),
).agg(
    sum("msPlayed").alias("total_msPlayed")
) \
    .withColumnRenamed('window.start', 'window_start') \
    .withColumnRenamed('window.end', 'window_end') \
    .orderBy(desc("total_msPlayed")) \
    .limit(20)

"""
consoleDump = kafkaMessages \
    .writeStream \
    .format("console") \
    .start()

consoleDump.awaitTermination()
"""
# Start running the query; print running counts to the console

consoleDump = popularTracks \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

query = popularTracks \
    .writeStream \
    .format("mongodb") \
    .option("spark.mongodb.output.uri", f"{mongo_uri}/{mongo_db}.popularTracks") \
    .option("checkpointLocation", "/tmp/checkpoints") \
    .outputMode("complete") \
    .start()

consoleDumpArtist = popularArtist \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

consoleDump.awaitTermination()
consoleDumpArtist.awaitTermination()
