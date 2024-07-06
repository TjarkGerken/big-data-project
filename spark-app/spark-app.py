from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType

dbUrl = 'jdbc:mysql://my-app-mariadb-service:3306/spotify'
dbOptions = {"user": "root", "password": "mysecretpw"}
dbSchema = 'spotify'

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Example Part 1
# Create a spark session
spark = SparkSession.builder \
    .appName("Use Case").getOrCreate()

# Set log level
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

# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("endTime", StringType()) \
    .add("artistName", StringType()) \
    .add("trackName", StringType()) \
    .add("UID", StringType()) \
    .add("msPlayed", IntegerType())

# Example Part 3
# Convert value: binary -> JSON -> fields + parsed timestamp
trackingMessages = kafkaMessages.select(
    # Extract 'value' from Kafka message (i.e., the tracking data)
    from_json(
        column("value").cast("string"),
        trackingMessageSchema
    ).alias("json")
).select(
    column("json.*")
)

topSongs = trackingMessages.groupBy(
    col("UID"), col("trackName"), col("artistName")
).agg(
    {"msPlayed": "sum"}
).withColumnRenamed("sum(msPlayed)", "total_msPlayed") \
 .orderBy(col("total_msPlayed").desc()) \

topArtists = trackingMessages.groupBy(
    col("UID"), col("artistName")
).agg(
    {"msPlayed": "sum"}
).withColumnRenamed("sum(msPlayed)", "total_msPlayed") \
    .orderBy(col("total_msPlayed").desc())\

print("\n\n\n\n\n\n\Write to MariaDB\n\n\n\n")


def write_to_db(batch_df, batch_id, table_name):
    batch_df.write \
        .format("jdbc") \
        .option("url", dbUrl) \
        .option("dbtable", table_name) \
        .option("user", dbOptions["user"]) \
        .option("password", dbOptions["password"]) \
        .mode("append") \
        .save()

query = topSongs \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(lambda df, id: write_to_db(df, id, "top_songs")) \
    .start()

query2 = topArtists \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(lambda df, id: write_to_db(df, id, "top_artists")) \
    .start()

query.awaitTermination()
query2.awaitTermination()