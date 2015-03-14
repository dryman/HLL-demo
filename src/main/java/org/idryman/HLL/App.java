package org.idryman.HLL;

import net.agkn.hll.HLL;

import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {
      final HashFunction hash_func = Hashing.murmur3_128(123456);
      HLL hll = new HLL(14,5);
      final long batch = 100000000L;
      for (long i=0; i<100; i++) {
        for (long j=0; j<batch; j++) {
          long ij = i*batch + j;
          hll.addRaw(hash_func.hashLong(ij).asLong());
        }
        long ii = (i+1)*batch;
        double err_ratio = (hll.cardinality()-ii)/(double)ii*100;
        System.out.println(ii+","+err_ratio);
      }
    }
}
