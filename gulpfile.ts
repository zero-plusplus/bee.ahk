import * as gulp from 'gulp';
import * as del from 'del';
import * as mkdirp from 'mkdirp';
import { AhkInliner } from './external/AhkInliner';

const buildDir = './build';
export const clean = async(): Promise<void> => {
  await del(buildDir);
};
export const build_v2 = async(): Promise<void> => {
  const ahkVersion_2 = 2;
  const inliner_v2 = new AhkInliner(ahkVersion_2);
  mkdirp.sync(buildDir);
  inliner_v2.write('./src/bee.ahk2', './build/bee.ahk2');

  return Promise.resolve();
};
export const build = gulp.series(clean, build_v2);

export const watch = async(): Promise<void> => {
  const watchTask = async(): Promise<void> => {
    await gulp.series(
      async function taskStart(): Promise<void> {
        return Promise.resolve();
      },
      gulp.parallel(build),
      async function taskDone(): Promise<void> {
        return Promise.resolve();
      },
    )(() => '');
  };
  gulp.watch([ 'src/**/*.*', 'src/**/.*.*' ], { ignoreInitial: false }, watchTask);
  return Promise.resolve();
};
