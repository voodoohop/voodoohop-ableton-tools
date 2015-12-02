TAGLIB_VERSION:=1.9.1
TAGLIB:=taglib-$(TAGLIB_VERSION)

EMCXX:=em++
EXPORTED_FUNCTIONS:='["_taglib_js_open", "_taglib_js_close", "_taglib_js_get_metadata", "_taglib_js_get_audio_properties"]'
CXXFLAGS:=-O2 -s ASM_JS=1 -s USE_TYPED_ARRAYS=2 -s TOTAL_MEMORY=128000000 
LINKFLAGS:=-s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) $(CXXFLAGS)
EMMAKE:=emmake
TAGLIB_URL:="https://github.com/taglib/taglib/releases/download/v1.9.1/taglib-1.9.1.tar.gz"
TAR:=tar
# Beurk!
INCLUDE_DIRS=$(shell find taglib-1.9.1/taglib | grep '\.h$$' | while read i; do dirname $$i; done | sort -u)

all: dist/taglib.js

dist/taglib.js: $(TAGLIB) src/wrapper.cpp.o src/pre.js src/post.js src/library.js
	$(EMCXX) $(LINKFLAGS) --pre-js src/pre.js --post-js src/post.js --js-library src/library.js $(shell find build/taglib -name '*.cpp.o') src/wrapper.cpp.o -o $@

$(TAGLIB): $(TAGLIB).tar.gz stamp-taglib-build

stamp-taglib-build:
	$(TAR) xzvf $(TAGLIB).tar.gz && \
	patch -p0 < src/emscripten-build.patch && \
	rm -rf build && \
	mkdir -p build && \
	cd build && \
	cmake -DCMAKE_CXX_FLAGS="$(CXXFLAGS)" -DEMSCRIPTEN=1 -DCMAKE_TOOLCHAIN_FILE=../src/Emscripten_unix.cmake ../$(TAGLIB) && \
	$(EMMAKE) make VERBOSE=1
	touch stamp-taglib-build

$(TAGLIB).tar.gz:
	test -e "$@" || wget $(TAGLIB_URL)

clean:
	$(RM) -rf $(TAGLIB) src/wrapper.cpp.o stamp-taglib-build

src/wrapper.cpp.o: src/wrapper.cpp
	$(EMCXX) $(CXXFLAGS) -Ibuild $(INCLUDE_DIRS:%=-I%) -c $< -o $@

distclean: clean
	$(RM) $(TAGLIB).tar.gz

.PHONY: clean distclean
