#/bin/bash
{
    # try
    cp ./build_scripts/linux/binding.gyp ./binding.gyp
    cp ./build_scripts/linux/CMakeLists.txt ./CMakeLists.txt
    cp ./build_scripts/linux/install_deps.sh ./install_deps.sh

    /bin/bash ./install_deps.sh
} || { 
    # catch
    rm -f ./binding.gyp ./CMakeLists.txt ./install_deps.sh
}