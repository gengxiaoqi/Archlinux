# lz4cat
# Autogenerated from man page /usr/share/man/man1/lz4cat.1.gz
# using Deroffing man parser
complete -c lz4cat -s z -l compress --description 'Compress.'
complete -c lz4cat -s d -l decompress -l uncompress --description 'Decompress.'
complete -c lz4cat -s t -l test --description 'Test the integrity of compressed  . lz4 files.'
complete -c lz4cat -s 1 --description 'fast compression (default).'
complete -c lz4cat -s 9 --description 'high compression.'
complete -c lz4cat -s f -l '[no-]force' --description 'This option has several effects: . RS.'
complete -c lz4cat -s c -l stdout -l to-stdout --description 'force write to standard output, even if it is the console.'
complete -c lz4cat -s m -l multiple --description 'Multiple file names.'
complete -c lz4cat -o 'B#' --description 'block size [4-7](default : 7)  B4= 64KB ; B5= 2… [See Man Page]'
complete -c lz4cat -o BD --description 'block dependency (improve compression ratio).'
complete -c lz4cat -l '[no-]frame-crc' --description 'select frame checksum (default:enabled).'
complete -c lz4cat -l '[no-]content-size' --description 'header includes original size (default:not pres… [See Man Page]'
complete -c lz4cat -l '[no-]sparse' --description 'sparse mode support (default:enabled on file, d… [See Man Page]'
complete -c lz4cat -s l --description 'use Legacy format (useful for Linux Kernel compression) .'
complete -c lz4cat -s v -l verbose --description 'verbose mode.'
complete -c lz4cat -s q -l quiet --description 'suppress warnings; specify twice to suppress errors too.'
complete -c lz4cat -o h/-H --description 'display help/long help and exit.'
complete -c lz4cat -s V -l version --description 'display Version number and exit.'
complete -c lz4cat -s k -l keep --description 'Don\'t delete source file.'
complete -c lz4cat -s b --description 'benchmark file(s).'
complete -c lz4cat -s x --description 'or long command.'
complete -c lz4cat -l long-word --description 'Short commands can be concatenated together.  For example,.'
complete -c lz4cat -o dc --description 'Long commands cannot be concatenated.'
complete -c lz4cat -l force --description 'to be used like cat (1) for files that have not… [See Man Page]'
complete -c lz4cat -o 'i#' --description ' iteration loops [1-9](default : 3), benchmark mode only.'

