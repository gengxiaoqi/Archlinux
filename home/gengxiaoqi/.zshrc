# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
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

autoload -Uz colors && colors

autoload -Uz promptinit
promptinit
# PROMPT="%{$fg[red]%}%n%{$reset_color%}@%{$fg[blue]%}%m %{$fg_no_bold[yellow]%}%l~ %{$reset_color%}%# " 
PROMPT="%{$fg_bold[blue]%}%T %{$fg_bold[green]%}[%~]%{$reset_color%} "

# source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

alias ls='ls --color=auto'
LS_COLORS='fi=1;36:ln=1;33:'
export LS_COLORS

