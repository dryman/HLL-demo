package org.idryman.HLL;

import org.apache.commons.codec.binary.Hex;

import net.agkn.hll.HLL;

import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

public class Sticky {

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    final HashFunction hash_func = Hashing.murmur3_128(123456);
    HLL hll = new HLL(8,8);
    // 8,8, 10, 8
    final long batch = 10000000L;
    for (long i=0; i<10; i++) {
      for (long j=0; j<batch; j++) {
        long ij = i*batch + j;
        hll.addRaw(hash_func.hashLong(ij).asLong());
      }
      long ii = (i+1)*batch;
      long err = hll.cardinality()-ii;
      double err_ratio = err/(double)ii*100;
      //System.out.println(Hex.encodeHexString(hll.toBytes()).length());
      //System.out.println("/"+Hex.encodeHexString(hll.toBytes()));
      System.out.println(Hex.encodeHexString(hll.toBytes()).length()+","+ii+","+hll.cardinality()+","+err+","+err_ratio);
    }
  }

}
