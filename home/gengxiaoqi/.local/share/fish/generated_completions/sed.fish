# sed
# Autogenerated from man page /usr/share/man/man1/sed.1.gz
# using Deroffing man parser
complete -c sed -l help --description 'display this help and exit.'
complete -c sed -s n -l quiet -l silent --description 'suppress automatic printing of pattern space.'
complete -c sed -s e -l expression --description 'add the script to the commands to be executed.'
complete -c sed -s f -l file --description 'add the contents of script-file to the commands to be executed.'
complete -c sed -l follow-symlinks --description 'follow symlinks when processing in place.'
complete -c sed -o 'i[SUFFIX]' -l 'in-place[' --description 'edit files in place (makes backup if SUFFIX supplied).'
complete -c sed -s l -l line-length --description 'specify the desired line-wrap length for the `l\' command.'
complete -c sed -l posix --description 'disable all GNU extensions.'
complete -c sed -s r -l regexp-extended --description 'use extended regular expressions in the script.'
complete -c sed -s s -l separate --description 'consider files as separate rather than as a sin… [See Man Page]'
complete -c sed -s u -l unbuffered --description 'load minimal amounts of data from the input fil… [See Man Page]'
complete -c sed -s z -l null-data --description 'separate lines by NUL characters.'
complete -c sed -l version --description 'output version information and exit.'

