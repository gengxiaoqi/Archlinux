if exists("did load filetypes")
    finish
endif

augroup filetypedetect
	au BufRead,BufNewFile *.hoc setfiletype NEURON
	au BufRead,BufNewFile *.ses setfiletype NEURON
augroup END
