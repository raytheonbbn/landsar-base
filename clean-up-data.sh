echo "removing area data..."
rm -rf AreaData/*
echo "removing files in logs folder..."
rm logs/*


echo "removing database log..."
rm derby.log
# To delete user and after-action report databases, delete landsar folder
# rm -r landsar

echo "Removing logged requests..."
rm requests/*

echo "Removing stored LPIs..."
rm -rf web/missionPackages
mkdir web/missionPackages
rm -rf scenariosAndSearches/*
