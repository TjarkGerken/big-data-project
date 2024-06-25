import pyspark
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession, SQLContext, functions as F
from pyspark.sql.functions import *

# create a spark session
spark = SparkSession \
.builder \
.master("local") \
.appName("ABC") \
.config("spark.mongodb.read.connection.uri", "mongodb://admin:password@mongodb:27017/cool?authSource=admin") \
.config("spark.mongodb.write.connection.uri", "mongodb://admin:password@mongodb:27017/cool?authSource=admin") \
.config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector:10.0.2') \
.getOrCreate()


df = spark.read \
.format("mongodb") \
.option("uri", "mongodb://admin:password@mongodb:27017/cool?authSource=admin") \
.option("database", "cool") \
.option("collection", "questions") \
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
"""
query = kafkaMessages \
    .writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

query.awaitTermination()


parsedMessages = kafkaMessages.select(from_json(col("value").cast("string"), messageSchema).alias("data")).select("data.*")

parsedMessages = parsedMessages.withColumn("played_at", col("played_at").cast(TimestampType()))

query = parsedMessages \
     .writeStream \
     .format("mongodb") \
     .option("spark.mongodb.output.uri", f"{mongo_uri}/{mongo_db}.{mongo_collection}") \
     .option("checkpointLocation", "/tmp/checkpoints") \
     .outputMode("append") \
     .start()

query.awaitTermination()
"""

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
print("test")

df.printSchema()

# Wait for termination
spark.streams.awaitAnyTermination()
