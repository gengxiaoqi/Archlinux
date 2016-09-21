#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

# set font
#setfont ter-v28n

alias ls='ls --color=auto'

#PS1='[\u@\h \W]\$ '
PS1='\[\e[1;34m\]\@\[\e[0m\] \[\e[1;32m\][\W]\[\e[0m\] \[\e[1m\]\$\[\e[0m\] '
#PS1="\$(awk '/MemFree/{print \$2}' /proc/meminfo) promt >"

# load keyboard
#sudo loadkeys ~/.config/keymap.map

# set the dropbox command
# alias dropbox=~/dropbox.py

# set the fbterm
# alias fbterm='LANG=zh_CN.UTF-8 LC_ALL=zh_CN.UTF-8 fbterm'

#alias brightnessdec='sudo tee /sys/class/backlight/intel_backlight/brightness <<<300'

#alias sfwin="wine ~/.wine/drive_c/'Program Files (x86)'/'Stimfit 0.13'/Stimfit.exe"

# set screen
alias screenoff="xrandr --output eDP1 --off"
alias screenon="xrandr --output eDP1 --auto"
#alias screenleft="xrandr --output DP2-3 --left-of eDP1 | xrandr --output DP2-3 --auto"
#alias screenright="xrandr --output DP2-3 --right-of eDP1 | xrandr --output DP2-3 --auto"

# set LAN
alias lanon="systemctl start dhcpcd@enp0s25.service"

alias wifion="nmcli r wifi on"
alias wifioff="nmcli r wifi off"

#export LD_LIBRARY_PATH=/usr/local/lib/
#source /home/gengxiaoqi/SourceCode/neuron/nrnenv

#alias neuron=nrngui
#alias stimfitnopython=~/SourceCode/stimfit/stimfit
#alias minecraft="java -jar ~/Minecraft.jar"

#add command to history & save history
#shopt -s histappend PROMPT_COMMAND='history -a'

export GTK_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export QT_IM_MODULE=ibus

