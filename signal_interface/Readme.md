## Development Installation

In order to compile `Alice` you will need to install a lot of dependencies... for real, a lot!

### Git

Obviously you need git, but if you don't have it, do as follows:

- Download git from the following url: https://git-scm.com/download/win
- Run powershell as administrator
- Run `Set-ExecutionPolicy -Scope LocalMachine -ExecutionPolicy RemoteSigned -Force`
- Run `Install-Module posh-git -Scope CurrentUser -Force`
- Run `Import-Module posh-git`
- Run `Add-PoshGitToProfile -AllHosts`

### Cygwin

You might need Cygwin so install it: https://www.cygwin.com/
If there is a checkbox that says to add it to `$PATH`, check it.

You might have to copy it to your system environmental variables if it's not there.

### MinGW

You might need MinGW so install it: https://osdn.net/projects/mingw/downloads/68260/mingw-get-setup.exe/
If there is a checkbox that says to add it to `$PATH`, check it.

You might have to copy it to your system environmental variables if it's not there.

### CMake

Install cmake: https://cmake.org/download/.
If there is a checkbox that says to add it to `$PATH`, check it.

### Node JS

Install Node.js version 8.12.0, which is the one tested: https://nodejs.org/download/release/v8.12.0/

### Node-Gyp

Install node gyp from powershell with the following command: `npm install -g node-gyp`.

### Python 2

Node-Gyp seems to use python under the hood, so just in case, install Python 2 latest release: https://www.python.org/downloads/windows/ 

### command-line Build Tools

In order to compile c++ in powershell, you need to install visual studio's command-line Build Tools:

- Go to https://visualstudio.microsoft.com/downloads/
- expand `Tools for Visual Studio`
- Click on `Build Tools for Visual Studio`
- Install everything releated to Desktop and node

### Install Make

In order to compile SQLiteCPP you need make. Download and install it: http://gnuwin32.sourceforge.net/packages/make.htm. Also add it to your system env path

### Install OpenSSL

You need openSSL to handle cryptography, to install it do as follows:

- Download and install perl from: http://strawberryperl.com/ 
- Download the repo: https://github.com/openssl/openssl
- Open `Cross Tools Command Propmt`
- Go to the repo's dir
- Run `perl Configure no-asm VC-WIN64A`
- Run `nmake` and `nmake install`
