from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType, BooleanType, ArrayType

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Spotify Wrapped").getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('ERROR')

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

messageSchema = StructType() \
    .add("value", StringType()) \
    .add("track", StructType() \
         .add("album", StructType() \
              .add("album_type", StringType()) \
              .add("artists", ArrayType(StructType() \
                                        .add("external_urls", StructType() \
                                             .add("spotify", StringType())) \
                                        .add("href", StringType()) \
                                        .add("id", StringType()) \
                                        .add("name", StringType()) \
                                        .add("type", StringType()) \
                                        .add("uri", StringType()))) \
              .add("available_markets", ArrayType(StringType())) \
              .add("external_urls", StructType() \
                   .add("spotify", StringType())) \
              .add("href", StringType()) \
              .add("id", StringType()) \
              .add("images", ArrayType(StructType() \
                                       .add("height", IntegerType()) \
                                       .add("url", StringType()) \
                                       .add("width", IntegerType()))) \
              .add("name", StringType()) \
              .add("release_date", StringType()) \
              .add("release_date_precision", StringType()) \
              .add("total_tracks", IntegerType()) \
              .add("type", StringType()) \
              .add("uri", StringType())) \
         .add("artists", ArrayType(StructType() \
                                   .add("external_urls", StructType() \
                                        .add("spotify", StringType())) \
                                   .add("href", StringType()) \
                                   .add("id", StringType()) \
                                   .add("name", StringType()) \
                                   .add("type", StringType()) \
                                   .add("uri", StringType()))) \
         .add("available_markets", ArrayType(StringType())) \
         .add("disc_number", IntegerType()) \
         .add("duration_ms", IntegerType()) \
         .add("explicit", BooleanType()) \
         .add("external_ids", StructType() \
              .add("isrc", StringType())) \
         .add("external_urls", StructType() \
              .add("spotify", StringType())) \
         .add("href", StringType()) \
         .add("id", StringType()) \
         .add("is_local", BooleanType()) \
         .add("name", StringType()) \
         .add("popularity", IntegerType()) \
         .add("preview_url", StringType()) \
         .add("track_number", IntegerType()) \
         .add("type", StringType()) \
         .add("uri", StringType())) \
    .add("played_at", StringType()) \
    .add("context", StructType() \
         .add("type", StringType()) \
         .add("href", StringType()) \
         .add("external_urls", StructType() \
              .add("spotify", StringType())) \
         .add("uri", StringType()))

query = kafkaMessages \
    .writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

query.awaitTermination()

# Wait for termination
spark.streams.awaitAnyTermination()
