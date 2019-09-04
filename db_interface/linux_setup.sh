#!bin/bash
tempBuildFolder='deps'

function PSM() {
  tput setaf 2;tput bold; echo "$1"; tput sgr0;
}
function PEM() {
  tput setaf 1;tput setab 7; echo "$1"; tput sgr0;
}
function removeTempFolder1() {
  cd ..; rm -rf "${tempBuildFolder}"; return;
}
function removeTempFolder2() {
  cd ../..; rm -rf "${tempBuildFolder}"; return;
}
function removeTempFolder3() {
  cd ../../..; rm -rf "${tempBuildFolder}"; return;
}

echo "-----------------------------------------"
 PSM "             DB Interface";
echo "-----------------------------------------"

# Update repos list
sudo apt-get update > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to update repos list"
fi
printf "\n\n"

printf "  - Checking latest repos... \n";


# Install deps
printf "  - Installing build dependencies... \n";
INSTALL_DEPS_ERROR=$( { sudo apt-get install gcc cmake git pkg-config -y > /dev/null; } 2>&1 )

if [ $? -ne 0 ]; then
  PEM "      Failed to install deps"
  echo "Reason: "; PEM $INSTALL_DEPS_ERROR;
  return;
fi

# Temp folder
printf "  - Preparing build... \n";
mkdir "${tempBuildFolder}" > /dev/null;
cd "${tempBuildFolder}" > /dev/null;

echo "-----------------------------------------"
 PSM "             SQLite CPP Interface";
echo "-----------------------------------------"

# Download && build SQLite
printf "  - Downloading SQLiteCpp... \n";
git clone https://github.com/SRombauts/SQLiteCpp --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download SQLiteCpp";
  removeTempFolder1;
fi

printf "  - Creating build directory... \n";
cd ./SQLiteCpp > /dev/null;
mkdir build && cd build > /dev/null;

cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF .. > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to make SQLiteCpp";
  removeTempFolder3;
fi

# Ignore Warnings
cmake --build . > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to build SQLiteCpp";
  removeTempFolder3;
fi

sudo make install > /dev/null;
if [ $? -ne 0 ]; then
  PEM "    Failed to install SQLiteCpp";
  removeTempFolder3;
fi

cd ../..

echo "-----------------------------------------"
 PSM "             MODERN SQL Interface";
echo "-----------------------------------------"

# Download && build SQLite
printf "  - Downloading sqlite_modern_cpp... \n";
git clone https://github.com/SqliteModernCpp/sqlite_modern_cpp.git --quiet;
if [ $? -ne 0 ]; then
  PEM "    Failed to download sqlite_modern_cpp";
  removeTempFolder1;
fi

printf "  - Configuring and building sqlite_modern_cpp... \n";
cd ./sqlite_modern_cpp > /dev/null;

./configure > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to configure sqlite_modern_cpp";
  removeTempFolder2;
fi
make > /dev/null
if [ $? -ne 0 ]; then
  PEM "    Failed to make sqlite_modern_cpp";
  removeTempFolder2;
fi
sudo make install 
if [ $? -ne 0 ]; then
  PEM "    Failed to install sqlite_modern_cpp";
  removeTempFolder2;
fi

# Exit to tempBuildFolder's parent and remove
removeTempFolder3;
PSM "    Done.";
printf "\n"