Try {
    Copy-Item -path ./build_scripts/windows/binding.gyp -destination ./binding.gyp
    Copy-Item -path ./build_scripts/windows/CMakeLists.txt -destination ./CMakeLists.txt
    Copy-Item -path ./build_scripts/windows/install_deps.ps1 -destination ./install_deps.ps1
    ./install_deps.ps1
    node-gyp configure build
}

Catch {
    Write-Host $_.Exception.Message`n
}

Finally {
    Remove-Item ./binding.gyp -Force
    Remove-Item ./CMakeLists.txt -Force
    Remove-Item ./install_deps.ps1 -Force
}