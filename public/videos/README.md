# Local Video Uploads

For quick testing, put MP4 files in this folder.

Example:

```text
public/videos/oos-introduction.mp4
```

Then use this path in `src/data/courses.js`:

```js
videoUrl: '/videos/oos-introduction.mp4'
```

For production, use Cloudflare Stream, Mux, Vimeo, or another streaming provider and paste the secure video URL instead.
