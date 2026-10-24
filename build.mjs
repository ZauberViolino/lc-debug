import esbuild from "esbuild";
import { minifyTemplates, writeFiles } from "esbuild-minify-templates";

esbuild.build({
  entryPoints: ["index.js"], // 改成你的源文件路径
  outfile: "dist/min.js", // 压缩后的输出路径
  bundle: true,
  minify: true, // 启用JS压缩
  sourcemap: true,
  write: false, // ⚠️ 必须设为false，否则插件无法工作[reference:3]
  plugins: [
    minifyTemplates({
      // 插件默认会压缩所有模板字符串，这里可以配置细节
      keepComments: false, // 是否保留模板内的注释
    }), 
    writeFiles() // 负责将结果写入磁盘
  ],
});