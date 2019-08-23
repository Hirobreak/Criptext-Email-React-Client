mkdir deps
Set-Location deps
git config --global core.autocrlf false
git clone https://github.com/SRombauts/SQLiteCpp
Set-Location ./SQLiteCpp
mkdir build
Set-Location build
cmake -DSQLITECPP_BUILD_EXAMPLES=OFF -DSQLITECPP_BUILD_TESTS=OFF .. -G "MinGW Makefiles"
cmake --build .
make install
Set-Location ../../..
Remove-Item "./deps" -Recurse -Force