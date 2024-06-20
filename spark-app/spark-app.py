from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType, BooleanType, ArrayType

windowDuration = '1 minute'
slidingDuration = '1 minute'

mongo_uri = "mongodb://admin:password@mongodb:27017"
mongo_db = "spotify"
mongo_collection = "track_data"

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Spotify Wrapped") \
    .config("spark.mongodb.output.uri", mongo_uri) \
    .getOrCreate()

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

#query = kafkaMessages \
 #   .writeStream \
  #  .outputMode("append") \
   # .format("console") \
    #.start()

# query.awaitTermination()


parsedMessages = kafkaMessages.select(from_json(col("value").cast("string"), messageSchema).alias("data")).select("data.*")

parsedMessages = parsedMessages.withColumn("played_at", col("played_at").cast(TimestampType()))

#query = parsedMessages \
     #.writeStream \
     #.format("mongodb") \
     #.option("spark.mongodb.output.uri", f"{mongo_uri}/{mongo_db}.{mongo_collection}") \
     #.option("checkpointLocation", "/tmp/checkpoints") \
     #.outputMode("append") \
     #.start()

# query.awaitTermination()

df = spark.read.format("mongo").option("uri", f"{mongo_uri}/{mongo_db}.{mongo_collection}").load()
print("\n\n\n\n\test\n\n\n\n\n")
print(df.to_string())

top_Artist = kafkaMessages \
    .select(from_json(col("value").cast("string"), messageSchema).alias("value")) \
    .select("value.track.artists.name") \
    .groupBy("name") \
    .count() \
    .orderBy(desc("count"))

top_Artist_query = top_Artist \
     .writeStream \
     .outputMode("complete") \
     .format("console") \
     .start()

top_tracks = kafkaMessages \
     .select(from_json(col("value").cast("string"), messageSchema).alias("value")) \
     .select("value.track.name") \
     .groupBy("name") \
     .count() \
     .orderBy(desc("count"))

top_tracks_query = top_tracks \
     .writeStream \
     .outputMode("complete") \
     .format("console") \
     .start()



query.awaitTermination()


# Wait for termination
spark.streams.awaitAnyTermination()
