#!/bin/bash

# ROOT User Check
function checkroot {
  if [[ $(id -u) = 0 ]]; then
    echo -e " Checking For ROOT: ${g}PASSED${endc}"
  else
    echo -e " Checking For ROOT: ${r}FAILED${endc}
 ${y}This Script Needs To Run As ROOT${endc}"
    echo -e " ${b}ArchI0live.sh${enda} Will Now Exit"
    rm License
    echo
    sleep 1
    exit
  fi
}

################################################################################

function checklist {
		if [ -e "list_pacman" ]; then
				echo -e "List file is exist!"
		else
				echo -e "List file is missing!"
		fi

################################################################################

# Initial pacman -Syu
function initpacmanupd {
  echo; echo -e " Updating ..... | please stop any install process before updating  ";
  xterm -e pacman -Syu --noconfirm;
  echo "Update Completed";
  sleep 1;
}

################################################################################

# Requirements Check 
function checkxterm {
	which xterm > /dev/null 2>&1
	if [ "$?" -eq "0" ]; then
	echo [✔]::[Xterm]: installation found!;
else

echo [x]::[warning]:this script require Xterm ;
echo ""
echo [!]::[please wait]: Installing Xterm ..  ;
pacman -S xterm --noconfirm
echo ""
fi
sleep 2

}

################################################################################

#Install packages
for Pkgs in $(cat ./list_pacman)
do
		echo "Start to install $Pkgs\n"
		sudo pacman -S --noconfirm $Pkgs
		echo "Installing complete!\n"
done


################################################################################

# Install Emacs
#function installemacs {
#  echo
#  echo -e " Currently Installing ${b}Emacs${enda}"
#  echo -e " ${bu}GNU Emacs is an extensible, customizable text editor—and
# more. At its core is an interpreter for Emacs Lisp,
# a dialect of the Lisp Development language with
# extensions to support text editing.
# Read more about it here: ${b}https://goo.gl/2aEvFi${endc}"
#  echo && echo -en " ${y}Press Enter To Continue${endc}"
#  read input
#  echo -e " Installing ${b}Emacs${enda}"
#  xterm -e pacman -S --noconfirm emacs
#  echo -e " ${b}Emacs${enda} Was Successfully Installed"
#  echo && echo " Run Emacs From ${b}Development${endc}"
#  echo -en " ${y}Press Enter To Return To Menu${endc}"
#  echo
#  read input
#}
