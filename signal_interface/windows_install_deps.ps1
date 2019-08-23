# ================================================
# CHECK   libssl1.0-dev
# ================================================
mkdir deps
Set-Location deps
# ================================================
git config --global core.autocrlf false
git clone https://github.com/signalapp/libsignal-protocol-c.git
Set-Location ./libsignal-protocol-c
mkdir build
Set-Location build
cmake .. -G "MinGW Makefiles"
make -j4 install
Set-Location ../..
# ================================================
git clone https://github.com/DaveGamble/cJSON.git
Set-Location ./cJSON
mkdir build
Set-Location build
cmake -DBUILD_SHARED_LIBS=Off .. -G "MinGW Makefiles"
make -j4 install
Set-Location ../..
# ================================================
git clone https://github.com/civetweb/civetweb.git
Set-Location ./civetweb
make slib
cp include/* /usr/include/ > /dev/null
cp libcivetweb.so* /usr/lib/ > /dev/null
Set-Location ..
# ================================================
git clone https://github.com/gabime/spdlog.git
Set-Location ./spdlog
mkdir myBuild
Set-Location myBuild
cmake .. -G "MinGW Makefiles"
make -j4 install
Set-Location ../..
# ================================================
Remove-Item "./deps" -Recurse -Force