from pyspark import SparkContext, SparkConf
from pyspark.sql import SparkSession, SQLContext, functions as F
from pyspark.sql.functions import *
from pyspark.sql.types import StructType, StructField, StringType, LongType, MapType, IntegerType, ArrayType


windowDuration = '7 days'
slidingDuration = '7 days'

mongo_user = "admin"
mongo_pwd = "password"
mongo_uri = f"mongodb://{mongo_user}:{mongo_pwd}@mongodb:27017"
mongo_db = "local"
mongo_collection = "startup_log"



spark = SparkSession \
    .builder \
    .master("local") \
    .appName("Spotify Wrapped") \
    .config("spark.mongodb.read.connection.uri", mongo_uri) \
    .config("spark.mongodb.write.connection.uri", mongo_uri) \
    .config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:10.3.0') \
    .getOrCreate()

print(f'The PySpark {spark.version} version is running...\n\n\n\n\n\n\n')


schema = StructType([
    StructField("_id", StringType(), True),
    StructField("hostname", StringType(), True),
    StructField("startTime", StructType([
        StructField("$date", StringType(), True)
    ]), True),
    StructField("startTimeLocal", StringType(), True),
    StructField("cmdLine", StructType([
        StructField("net", StructType([
            StructField("bindIp", StringType(), True),
            StructField("port", IntegerType(), True),
            StructField("tls", StructType([
                StructField("mode", StringType(), True)
            ]), True)
        ]), True),
        StructField("processManagement", StructType([
            StructField("fork", StringType(), True),
            StructField("pidFilePath", StringType(), True)
        ]), True),
        StructField("systemLog", StructType([
            StructField("destination", StringType(), True),
            StructField("logAppend", StringType(), True),
            StructField("path", StringType(), True)
        ]), True)
    ]), True),
    StructField("pid", StructType([
        StructField("$numberLong", StringType(), True)
    ]), True),
    StructField("buildinfo", StructType([
        StructField("version", StringType(), True),
        StructField("gitVersion", StringType(), True),
        StructField("modules", ArrayType(StringType()), True),
        StructField("allocator", StringType(), True),
        StructField("javascriptEngine", StringType(), True),
        StructField("sysInfo", StringType(), True),
        StructField("versionArray", ArrayType(IntegerType()), True),
        StructField("openssl", StructType([
            StructField("running", StringType(), True),
            StructField("compiled", StringType(), True)
        ]), True),
        StructField("buildEnvironment", StructType([
            StructField("distmod", StringType(), True),
            StructField("distarch", StringType(), True),
            StructField("cc", StringType(), True),
            StructField("ccflags", StringType(), True),
            StructField("cxx", StringType(), True),
            StructField("cxxflags", StringType(), True),
            StructField("linkflags", StringType(), True),
            StructField("target_arch", StringType(), True),
            StructField("target_os", StringType(), True),
            StructField("cppdefines", StringType(), True)
        ]), True),
        StructField("bits", IntegerType(), True),
        StructField("debug", StringType(), True),
        StructField("maxBsonObjectSize", IntegerType(), True),
        StructField("storageEngines", ArrayType(StringType()), True)
    ]), True)
])


streamingDataFrame = (spark.readStream
                      .format("mongodb")
                      .option("database", mongo_db)
                      .option("collection", mongo_collection)
                      .schema(schema)
                      .load()
                      )

dataStreamWriter = (streamingDataFrame.writeStream
                    .trigger(continuous="1 second")
                    .format("memory")
                    .queryName("spotifyWrappedQuery") 
                    .outputMode("append")
                    )

try:
    query = dataStreamWriter.start()
    query.awaitTermination()
except Exception as e:
    print("Error  occured during streaming: %s", e)
