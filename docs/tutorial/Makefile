

all: pyrope.html pyrope.pdf

dist/presentation.html: presentation.md
	./node_modules/backslide/bin/bs export
	cp ring.svg dist

pyrope.html:dist/presentation.html
	cp dist/presentation.html pyrope.html

pyrope.pdf:dist/presentation.html
	./node_modules/decktape/decktape.js --chrome-arg=--no-sandbox ./dist/presentation.html pyrope.pdf

