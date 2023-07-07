
# Download the worldwind jar from github
mkdir worldwind
cd worldwind
wget https://github.com/NASAWorldWind/WorldWindJava/releases/download/v2.1.0/worldwind-v2.1.0.zip
unzip worldwind-v2.1.0.zip
cp worldwind.jar ../dependencies/
cd ..
rm -r worldwind

# Gradle downloads other dependencies from Maven Central and other Maven repositories
./gradlew copyRuntimeLibs
