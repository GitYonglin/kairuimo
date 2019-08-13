/**
 * 浮点数数组转有符号32位整数
 *
 * @export
 * @param {number[]} floats 浮点数数组
 */
function floatToBuffer(floats) {
  const ints = [];
  // 构造4字节buffer
  const buf = Buffer.allocUnsafe(4);
  floats.map(float => {
    const n = Number(float);
    buf.writeFloatLE(n, 0); // 浮点数转换位buffer
    let Hint = buf.readInt16LE(0); // 高16位转为整数
    Hint = Hint < 0 ? unTon(Hint) : Hint;
    let Lint = buf.readInt16LE(2); // 低16位转为整数
    Lint = Lint < 0 ? unTon(Lint) : Lint;
    console.log('33--', n, ' = ', Hint, '--', Lint);
    ints.push(Hint, Lint);
  });
  console.log(ints);
  return ints;
}
/**
 * 有符号32位整数转浮点数
 *
 * @export
 * @param {Buffer} buffers buffer数据
 */
function bufferToFloat(buffers: Buffer) {
  const fs = [];
  for (let index = 0; index < buffers.length; index += 4) {
    const b4 = buffers.slice(index, index + 4);
    b4.swap16(); // 16位整数高低位交换
    fs.push(Number(b4.readFloatLE(0))); // 32位转为浮点数
  }
  return fs;
}
/**
 * 有符号16位整数
 *
 * @export
 * @param {Buffer} buffers buffer数据
 */
function bufferTo16int(buffers: Buffer) {
  const ints = [];
  for (let index = 0; index < buffers.length; index += 2) {
    const b2 = buffers.slice(index, index + 2);
    ints.push(b2.readInt16BE(0));
    // console.log(b4.readInt16LE(0));
    // console.log(b4.readInt16BE(0));
  }
  return ints;
}
function unTon(n: number): number {
  return parseInt((~(n)).toString(2).padStart(16, 'x').replace(/0/g, 'x').replace(/1/g, '0').replace(/x/g, '1'), 2);
}
export const bf = {
  floatToBuffer,
  bufferToFloat,
  bufferTo16int
};
