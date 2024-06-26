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
    .add("UID", StringType()) \
    .add("msPlayed", IntegerType())


kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "spotify-tracks") \
    .load()

# Parse the Kafka messages using the provided schema
parsedMessages = kafkaMessages \
    .select(from_json(col("value").cast("string"), messageSchema).alias("data")) \
    .select("data.*")

# Convert endTime to timestamp type
parsedMessages = parsedMessages.withColumn("endTime", col("endTime").cast("timestamp"))

# Create a window specification
windowSpec = Window.partitionBy("UID", window("endTime", "1 year")).orderBy(sum("msPlayed").desc())

# Calculate total play time for each track and artist in each window
totalPlayTime = parsedMessages.groupBy("UID", window("endTime", "1 year"), "trackName", "artistName").agg(sum("msPlayed").alias("totalPlayTime"))

# Rank tracks and artists by total play time within each window
rankedTracksAndArtists = totalPlayTime.withColumn("rank", rank().over(windowSpec))

# Keep only the top 10 tracks and artists in each window
top10TracksAndArtists = rankedTracksAndArtists.filter(col("rank") <= 10)


