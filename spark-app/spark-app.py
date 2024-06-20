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

# read data from mongodb collection "questions" into a dataframe "df"
df = spark.read \
.format("mongodb") \
.option("uri", "mongodb://admin:password@mongodb:27017/cool?authSource=admin") \
.option("database", "cool") \
.option("collection", "questions") \
.load()

print("test")

df.printSchema()