# git-rev-list
# Autogenerated from man page /usr/share/man/man1/git-rev-list.1.gz
# using Deroffing man parser
complete -c git-rev-list -o '<number>' -s n -l max-count --description 'Limit the number of commits to output.'
complete -c git-rev-list -l skip --description 'Skip number commits before starting to show the commit output.'
complete -c git-rev-list -l since -l after --description 'Show commits more recent than a specific date.'
complete -c git-rev-list -l until -l before --description 'Show commits older than a specific date.'
complete -c git-rev-list -l max-age -l min-age --description 'Limit the commits output to specified time range.'
complete -c git-rev-list -l author -l committer --description 'Limit the commits output to ones with author/co… [See Man Page]'
complete -c git-rev-list -l grep-reflog --description 'Limit the commits output to ones with reflog en… [See Man Page]'
complete -c git-rev-list -l grep --description 'Limit the commits output to ones with log messa… [See Man Page]'
complete -c git-rev-list -l all-match --description 'Limit the commits output to ones that match all… [See Man Page]'
complete -c git-rev-list -l invert-grep --description 'Limit the commits output to ones with log messa… [See Man Page]'
complete -c git-rev-list -s i -l regexp-ignore-case --description 'Match the regular expression limiting patterns … [See Man Page]'
complete -c git-rev-list -l basic-regexp --description 'Consider the limiting patterns to be basic regu… [See Man Page]'
complete -c git-rev-list -s E -l extended-regexp --description 'Consider the limiting patterns to be extended r… [See Man Page]'
complete -c git-rev-list -s F -l fixed-strings --description 'Consider the limiting patterns to be fixed stri… [See Man Page]'
complete -c git-rev-list -l perl-regexp --description 'Consider the limiting patterns to be Perl-compa… [See Man Page]'
complete -c git-rev-list -l remove-empty --description 'Stop when a given path disappears from the tree.'
complete -c git-rev-list -l merges --description 'Print only merge commits.'
complete -c git-rev-list -l no-merges --description 'Do not print commits with more than one parent.'
complete -c git-rev-list -l min-parents -l max-parents -l no-min-parents -l no-max-parents --description 'Show only commits which have at least (or at mo… [See Man Page]'
complete -c git-rev-list -l first-parent --description 'Follow only the first parent commit upon seeing a merge commit.'
complete -c git-rev-list -l not --description 'Reverses the meaning of the ^ prefix (or lack t… [See Man Page]'
complete -c git-rev-list -l all --description 'Pretend as if all the refs in refs/ are listed … [See Man Page]'
complete -c git-rev-list -l 'branches[' --description 'Pretend as if all the refs in refs/heads are li… [See Man Page]'
complete -c git-rev-list -l 'tags[' --description 'Pretend as if all the refs in refs/tags are lis… [See Man Page]'
complete -c git-rev-list -l 'remotes[' --description 'Pretend as if all the refs in refs/remotes are … [See Man Page]'
complete -c git-rev-list -l glob --description 'Pretend as if all the refs matching shell glob … [See Man Page]'
complete -c git-rev-list -l exclude --description 'Do not include refs matching <glob-pattern> tha… [See Man Page]'
complete -c git-rev-list -l reflog --description 'Pretend as if all objects mentioned by reflogs … [See Man Page]'
complete -c git-rev-list -l ignore-missing --description 'Upon seeing an invalid object name in the input… [See Man Page]'
complete -c git-rev-list -l stdin --description 'In addition to the <commit> listed on the comma… [See Man Page]'
complete -c git-rev-list -l quiet --description 'Don\\(cqt print anything to standard output.'
complete -c git-rev-list -l cherry-mark --description 'Like --cherry-pick (see below) but mark equival… [See Man Page]'
complete -c git-rev-list -l cherry-pick --description 'Omit any commit that introduces the same change… [See Man Page]'
complete -c git-rev-list -l left-only -l right-only --description 'List only commits on the respective side of a s… [See Man Page]'
complete -c git-rev-list -l cherry --description 'A synonym for --right-only --cherry-mark --no-m… [See Man Page]'
complete -c git-rev-list -s g -l walk-reflogs --description 'Instead of walking the commit ancestry chain, w… [See Man Page]'
complete -c git-rev-list -l merge --description 'After a failed merge, show refs that touch file… [See Man Page]'
complete -c git-rev-list -l boundary --description 'Output excluded boundary commits.'
complete -c git-rev-list -l use-bitmap-index --description 'Try to speed up the traversal using the pack bi… [See Man Page]'
complete -c git-rev-list -l progress --description 'Show progress reports on stderr as objects are considered.'
complete -c git-rev-list -l simplify-by-decoration --description 'Commits that are referred by some branch or tag are selected.'
complete -c git-rev-list -l full-history --description 'Same as the default mode, but does not prune some history.'
complete -c git-rev-list -l dense --description 'Only the selected commits are shown, plus some … [See Man Page]'
complete -c git-rev-list -l sparse --description 'All commits in the simplified history are shown.'
complete -c git-rev-list -l simplify-merges --description 'Additional option to --full-history to remove s… [See Man Page]'
complete -c git-rev-list -l ancestry-path --description 'When given a range of commits to display (e. g.  commit1.'
complete -c git-rev-list -l bisect --description 'Limit output to the one commit object which is … [See Man Page]'
complete -c git-rev-list -l bisect-vars --description 'This calculates the same as --bisect, except th… [See Man Page]'
complete -c git-rev-list -l bisect-all --description 'This outputs all the commit objects between the… [See Man Page]'
complete -c git-rev-list -l date-order --description 'Show no parents before all of its children are … [See Man Page]'
complete -c git-rev-list -l author-date-order --description 'Show no parents before all of its children are … [See Man Page]'
complete -c git-rev-list -l topo-order --description 'Show no parents before all of its children are … [See Man Page]'
complete -c git-rev-list -l reverse --description 'Output the commits in reverse order.'
complete -c git-rev-list -l objects --description 'Print the object IDs of any object referenced b… [See Man Page]'
complete -c git-rev-list -l objects-edge --description 'Similar to --objects, but also print the IDs of… [See Man Page]'
complete -c git-rev-list -l objects-edge-aggressive --description 'Similar to --objects-edge, but it tries harder … [See Man Page]'
complete -c git-rev-list -l indexed-objects --description 'Pretend as if all trees and blobs used by the i… [See Man Page]'
complete -c git-rev-list -l unpacked --description 'Only useful with --objects; print the object ID… [See Man Page]'
complete -c git-rev-list -l 'no-walk[' --description 'Only show the given commits, but do not travers… [See Man Page]'
complete -c git-rev-list -l do-walk --description 'Overrides a previous --no-walk.'
complete -c git-rev-list -l 'pretty[' -l format --description 'Pretty-print the contents of the commit logs in… [See Man Page]'
complete -c git-rev-list -l abbrev-commit --description 'Instead of showing the full 40-byte hexadecimal… [See Man Page]'
complete -c git-rev-list -l no-abbrev-commit --description 'Show the full 40-byte hexadecimal commit object name.'
complete -c git-rev-list -l oneline --description 'This is a shorthand for "--pretty=oneline --abb… [See Man Page]'
complete -c git-rev-list -l encoding --description 'The commit objects record the encoding used for… [See Man Page]'
complete -c git-rev-list -l expand-tabs -l expand-tabs -l no-expand-tabs --description 'Perform a tab expansion (replace each tab with … [See Man Page]'
complete -c git-rev-list -l show-signature --description 'Check the validity of a signed commit object by… [See Man Page]'
complete -c git-rev-list -l relative-date --description 'Synonym for --date=relative.'
complete -c git-rev-list -l date --description 'Only takes effect for dates shown in human-read… [See Man Page]'
complete -c git-rev-list -l header --description 'Print the contents of the commit in raw-format;… [See Man Page]'
complete -c git-rev-list -l parents --description 'Print also the parents of the commit (in the fo… [See Man Page]'
complete -c git-rev-list -l children --description 'Print also the children of the commit (in the f… [See Man Page]'
complete -c git-rev-list -l timestamp --description 'Print the raw commit timestamp.'
complete -c git-rev-list -l left-right --description 'Mark which side of a symmetric diff a commit is reachable from.'
complete -c git-rev-list -l graph --description 'Draw a text-based graphical representation of t… [See Man Page]'
complete -c git-rev-list -l 'show-linear-break[' --description 'When --graph is not used, all history branches … [See Man Page]'
complete -c git-rev-list -l count --description 'Print a number stating how many commits would h… [See Man Page]'
complete -c git-rev-list -l 'all-match).' --description '.'
complete -c git-rev-list -l 'merges.' --description '.'
complete -c git-rev-list -s 1 --description '(negative numbers denote no upper limit).'
complete -c git-rev-list -l 'not.' --description '.'
complete -c git-rev-list -l branches --description '.'
complete -c git-rev-list -l tags --description '.'
complete -c git-rev-list -l remotes --description '.'
complete -c git-rev-list -l 'all.' --description '/* is intended, it must be given explicitly.'
complete -c git-rev-list -l 'left-right.' --description '.'
complete -c git-rev-list -l 'no-merges;' --description 'git log --cherry upstream.'
complete -c git-rev-list -l pretty --description 'format other than oneline (for obvious reasons)… [See Man Page]'
complete -c git-rev-list -l 'date.' --description ' 4. c   4.  4. 2.'
complete -c git-rev-list -l 'reverse.' --description 'git-reflog(1).'
complete -c git-rev-list -s '.' --description '.'
complete -c git-rev-list -l full-history: --description 'oc o 2. 3.'
complete -c git-rev-list -l 'bisect.)' --description '.'
complete -c git-rev-list -l 'walk-reflogs.' --description '.'
complete -c git-rev-list -l 'objects;' --description '.'
complete -c git-rev-list -l 'graph.' --description '.'
complete -c git-rev-list -l 'no-walk.' --description '.'
complete -c git-rev-list -l 'pretty.' --description 'log.'
complete -c git-rev-list -o local --description 'is appended to the format (e. g.'
complete -c git-rev-list -l raw --description '.'
complete -c git-rev-list -l 'no-abbrev.' --description 'oc o 2. 3.'
complete -c git-rev-list -l color --description 'auto settings of the former if we are going to a terminal).'

