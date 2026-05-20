# Cairo local font files

Place the following WOFF2 files here before building/deploying the frontend:

- `Cairo-Regular.woff2`  — font-weight 400
- `Cairo-Medium.woff2`   — font-weight 500
- `Cairo-SemiBold.woff2` — font-weight 600
- `Cairo-Bold.woff2`     — font-weight 700

The project already references these files from `src/app/globals.css` and preloads the two critical weights in `src/app/layout.tsx`.

Do not rename the files unless you also update the paths in `globals.css` and `layout.tsx`.
