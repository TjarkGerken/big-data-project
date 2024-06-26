import pyspark
from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession, SQLContext, functions as F
from pyspark.sql.functions import *
from pyspark.sql.types import StructType, IntegerType, StringType
from pyspark.sql import Window

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
parsedMessages = kafkaMessages \
    .select(from_json(col("value").cast("string"), messageSchema).alias("data")) \
    .select("data.*")

# Convert endTime to timestamp type
parsedMessages = parsedMessages.withColumn("endTime", col("endTime").cast("timestamp"))

# Create a window specification
windowSpec = Window.partitionBy("UID").orderBy(unix_timestamp(col("endTime")))

# Calculate total play time for each track and artist in each window
totalPlayTime = parsedMessages \
    .groupBy("UID", F.window("endTime", "7 days").alias("window"), "trackName", "artistName") \
    .agg(sum("msPlayed").alias("totalPlayTime"))


windowSpecRank = Window.partitionBy("UID", "window.start").orderBy(col("totalPlayTime").desc())

# Rank tracks and artists by total play time within each window
rankedTracksAndArtists = totalPlayTime.withColumn("rank", rank().over(windowSpecRank))


# Keep only the top 10 tracks and artists in each window
top10TracksAndArtists = rankedTracksAndArtists.filter(col("rank") <= 10)