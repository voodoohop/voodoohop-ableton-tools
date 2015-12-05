#include <string.h>
#include "tpropertymap.h"
#include "id3v2tag.h"
#include "mp4file.h"
#include "mpegfile.h"
#include "vorbisfile.h"
#include "oggflacfile.h"
#include "speexfile.h"
#include "wavfile.h"
#include "aifffile.h"

extern "C" {
  long taglib_js_length(int fileref);
  long taglib_js_tell(int fileref);
  void taglib_js_seek(int fireref, long position);
  long taglib_js_read(int fileref, unsigned long len, char *data);
  void taglib_js_add_metadata(int fileref, const char *key, const char *value);
  void taglib_js_add_audio_property(int fileref, const char *key, int value);
}

namespace TagLib {
  class JsIOStream : public IOStream {
    int      fileref;
    FileName filename;

    public:

      JsIOStream (FileName fname, int fref) {
        fileref = fref;
        filename = fname;
      };

      FileName name () const {
        return filename;
      };

      void clear () {
        // TODO
      };

      bool isOpen() const {
        return true;
      };

      bool readOnly () const {
        return true;
      };

      long length () {
        return taglib_js_length(fileref);
      };

      long tell () const {
        return taglib_js_tell(fileref);
      };

      void seek (long offset, Position p = Beginning) {
        switch (p) {
          case Beginning:
            break;
          case Current:
            offset = taglib_js_tell(fileref) + offset;
            break;
          case End:
            offset = taglib_js_length(fileref) + offset;
            break;
        }
        return taglib_js_seek(fileref, offset);
      };

      void truncate (long length) {
        // TODO
      };

      ByteVector readBlock (ulong len) {
        if (len == 0)
          return ByteVector::null;

        ByteVector ret(static_cast<uint>(len));

        long read = taglib_js_read(fileref, len, ret.data());
        ret.resize(read);

        return ret;
      };

      void writeBlock (const ByteVector &data) {
         // TODO
      };

      void insert(const ByteVector &data, ulong start = 0, ulong replace = 0) {
        // TODO
      };

      void removeBlock(ulong start = 0, ulong length = 0) {
        // TODO
      }
  };
}
extern "C" {
  void *taglib_js_open(const char *type, const char *fname, int fref) {
    TagLib::JsIOStream *stream = new TagLib::JsIOStream(fname, fref);
    TagLib::File *file = NULL;
  
    if (strcmp(type, "ogg/vorbis") == 0)
      file = new TagLib::Ogg::Vorbis::File((TagLib::IOStream *)stream);
    else if (strcmp(type, "ogg/flac") == 0)
      file = new TagLib::Ogg::FLAC::File((TagLib::IOStream *)stream);
    else if (strcmp(type, "ogg/speex") == 0)
      file = new TagLib::Ogg::Speex::File((TagLib::IOStream *)stream);
    else if (strcmp(type, "mpeg") == 0)
      file = new TagLib::MPEG::File((TagLib::IOStream *)stream, TagLib::ID3v2::FrameFactory::instance());
    else if (strcmp(type, "mp4") == 0)
      file = new TagLib::MP4::File((TagLib::IOStream *)stream); 
    else if (strcmp(type, "wav") == 0)
      file = new TagLib::RIFF::WAV::File((TagLib::IOStream *)stream);
    else if (strcmp(type, "aiff") == 0)
      file = new TagLib::RIFF::AIFF::File((TagLib::IOStream *)stream);
  
    return (void *)file;
  }

  void taglib_js_close(void *fptr) {
    TagLib::File *file = (TagLib::File *)fptr;
    delete file;
  }

  void taglib_js_get_metadata(void *fptr, int fref) {
    TagLib::File *file = (TagLib::File *)fptr;
    TagLib::PropertyMap props = file->properties();
    TagLib::PropertyMap::Iterator i;
    TagLib::StringList l;
    const char *key;
    TagLib::StringList::Iterator j;

    for (i = props.begin(); i != props.end(); i++) {
      key = (*i).first.toCString(bool(true));
      l = (*i).second;
      for (j = l.begin(); j != l.end(); j++) {
        taglib_js_add_metadata(fref, key, (*j).toCString(bool(true)));
      }
    }
  }

  void taglib_js_get_audio_properties(void *fptr, int fref) {
    TagLib::File *file = (TagLib::File *)fptr;
    TagLib::AudioProperties *props = file->audioProperties();

    if (props == NULL)
      return;

    taglib_js_add_audio_property(fref, "duration", props->lengthInMilliseconds());
    taglib_js_add_audio_property(fref, "bitrate", props->bitrate());
    taglib_js_add_audio_property(fref, "channels", props->channels());
    taglib_js_add_audio_property(fref, "samplerate", props->sampleRate());
  }
}
