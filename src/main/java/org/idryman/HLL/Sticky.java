package org.idryman.HLL;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.apache.commons.codec.binary.Hex;

import net.agkn.hll.HLL;

import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

public class Sticky {
  static Calendar cal = Calendar.getInstance();
  static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH");
  
  static void printHLL(HLL hll) {
    cal.add(Calendar.HOUR, 1);
    System.out.println(format.format(cal.getTime())+":00:00,/x"+Hex.encodeHexString(hll.toBytes()));
    //System.out.println(Hex.encodeHexString(hll.toBytes()).length());
  }

  public static void main(String[] args) {
    
    // TODO Auto-generated method stub
    final HashFunction hash_func = Hashing.murmur3_128(123456);
    HLL hll_base = new HLL(8,5);

    // 8,8, 10, 8
    final long batch = 100000L;
    
    for (long j=0; j<batch; j++) {
      hll_base.addRaw(hash_func.hashLong(j).asLong());
    }
    System.out.println("date, hyperloglog");
    printHLL(hll_base);
    
    for (long i=1; i< 100; i++){
      HLL hll = new HLL(8,5);
      for (long j=0; j<batch; j++) {
        long ij = i*batch + j;
        hll.addRaw(hash_func.hashLong(ij).asLong());
      }
      hll.union(hll_base);
      printHLL(hll);
    }
    
    
//    for (long i=0; i<10; i++) {
//      for (long j=0; j<batch; j++) {
//        long ij = i*batch + j;
//        hll.addRaw(hash_func.hashLong(ij).asLong());
//      }
//      long ii = (i+1)*batch;
//      long err = hll.cardinality()-ii;
//      double err_ratio = err/(double)ii*100;
//      //System.out.println(Hex.encodeHexString(hll.toBytes()).length());
//      //System.out.println("/"+Hex.encodeHexString(hll.toBytes()));
//      System.out.println(Hex.encodeHexString(hll.toBytes()).length()+","+ii+","+hll.cardinality()+","+err+","+err_ratio);
//    }
  }

}
