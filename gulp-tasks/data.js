"use strict";

import { paths } from "../gulpfile.babel";
import gulp from "gulp";
import debug from "gulp-debug";

gulp.task("data", () => {
    return gulp.src(paths.data.src)
        .pipe(gulp.dest(paths.data.dist))
        .pipe(debug({
            "title": "Data"
        }));
});