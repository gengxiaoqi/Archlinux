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

autoload -Uz run-help
autoload -Uz run-help-git
autoload -Uz run-help-svn
autoload -Uz run-help-svk
unalias run-help
alias help=run-help

alias ll='ls -l'
alias la='ls -a'

autoload -Uz colors && colors

# autoload -Uz promptinit && promptinit
PROMPT="%{$fg_bold[blue]%}%T %{$fg_bold[green]%}[%~]%{$reset_color%} "

alias ls='ls --color=auto'
LS_COLORS='fi=1;36:ln=1;33:'
export LS_COLORS

