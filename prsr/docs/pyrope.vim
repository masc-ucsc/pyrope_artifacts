" Description: pyrope MRI for pyrope files

call ale#linter#Define('pyrope', {
\   'name': 'pyrope',
\   'executable': 'prp',
\   'output_stream': 'stderr',
\   'command': 'prp %t',
\   'callback': 'ale#handlers#gcc#HandleGCCFormat',
\})
