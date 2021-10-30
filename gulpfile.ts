import { promises as fs } from 'fs';
import * as gulp from 'gulp';
import * as del from 'del';
import * as mkdirp from 'mkdirp';
import { AhkVersion, IncludeInliner } from '@zero-plusplus/autohotkey-utilities';
// import { AhkInliner } from './external/AhkInliner';

const buildDir = './build';
export const clean = async(): Promise<void> => {
  await del(buildDir);
};
export const build_v2 = async(): Promise<void> => {
  const inliner_v2 = new IncludeInliner(new AhkVersion('2.0'));
  mkdirp.sync(buildDir);

  const source = inliner_v2.exec('./src/bee.ahk2');
  return fs.writeFile('./build/bee.ahk2', source, 'utf-8');
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
