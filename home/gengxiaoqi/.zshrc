# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=10000
SAVEHIST=10000
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/gengxiaoqi/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

zstyle ':completion:*' menu select=3
# Enable menu select, use Emacs style key
# Set menu select enable when more than 2 options

setopt menu_complete

autoload -Uz run-help
autoload -Uz run-help-git
autoload -Uz run-help-svn
autoload -Uz run-help-svk
#unalias run-help
alias help=run-help

alias ll='ls -lh'
alias la='ls -a'
alias ls='ls --color=auto'
LS_COLORS='fi=1;36:ln=1;33:'
export LS_COLORS
alias grep='grep --color'
alias wifion='nmcli r wifi on'
alias wifioff='nmcli r wifi off'
alias shutdown='shutdown now'
alias imagej='/home/gengxiaoqi/ImageJ/ImageJ'

autoload -Uz colors && colors

# autoload -Uz promptinit && promptinit
PROMPT="%{$fg_bold[blue]%}%T %{$fg_bold[green]%}[%~]%{$reset_color%} "

# source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

