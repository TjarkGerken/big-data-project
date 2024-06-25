import pyspark
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession, SQLContext, functions as F
from pyspark.sql.functions import *

# create a spark session
spark = SparkSession \
.builder \
.master("local") \
.appName("Spotify Wrapped") \
.config("spark.mongodb.read.connection.uri", "mongodb://admin:password@mongodb:27017/results?authSource=admin") \
.config("spark.mongodb.write.connection.uri", "mongodb://admin:password@mongodb:27017/results?authSource=admin") \
.config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector:10.0.2') \
.getOrCreate()

messageSchema = StructType() \
    .add("endTime", StringType()) \
    .add("artistName", StringType()) \
    .add("trackName", StringType()) \
    .add("msPlayed", IntegerType())


query = kafkaMessages \
    .writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

#query.awaitTermination()


parsedMessages = kafkaMessages.select(from_json(col("value").cast("string"), messageSchema).alias("data")).select("data.*")

parsedMessages = parsedMessages.withColumn("played_at", col("played_at").cast(TimestampType()))




# Wait for termination
spark.streams.awaitAnyTermination()
