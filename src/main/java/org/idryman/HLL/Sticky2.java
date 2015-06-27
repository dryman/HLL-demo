package org.idryman.HLL;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;

import org.apache.commons.codec.binary.Hex;

import com.google.common.collect.Lists;
import com.google.common.hash.HashFunction;
import com.google.common.hash.Hashing;

import net.agkn.hll.HLL;

public class Sticky2 {
  static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH");
  static final HashFunction hash_func = Hashing.murmur3_128(123456);
  public static void main(String[] args) {
    Calendar cal = Calendar.getInstance();
    cal.set(Calendar.HOUR_OF_DAY, cal.getActualMinimum(Calendar.HOUR_OF_DAY));
    cal.set(Calendar.MINUTE, cal.getActualMinimum(Calendar.MINUTE));
    cal.set(Calendar.SECOND, cal.getActualMinimum(Calendar.SECOND));
    cal.set(Calendar.MILLISECOND, cal.getActualMinimum(Calendar.MILLISECOND));
    // TODO Auto-generated method stub

    ArrayList<Container> items = Lists.newArrayList();
    long acc = 0;
    for (int i = 0; i< 72; i++) {
      String time = format.format(cal.getTime())+":00:00,";
      int hour = cal.get(Calendar.HOUR);
      double degree = hour*7.5;
      double radian = Math.toRadians(degree);
      long diff = (long)((Math.sin(radian)+0.7)*100000);
      
      Container item = new Container(time, acc, acc+diff);
      acc+=diff;
      
      // white noise
      for (long j=-800;j<0;j++) {
        item.hll.addRaw(hash_func.hashLong(j).asLong());
      }
      
      items.add(item);
      
      cal.add(Calendar.HOUR, 1);
    }
    // similar item between before and after
    for (int i=1; i<71; i++) {
      Container before = items.get(i-1);
      Container current = items.get(i);
      Container after = items.get(i+1);
      for (long j=(before.start+before.end)/2;j<before.end;j++) {
        current.hll.addRaw(hash_func.hashLong(j).asLong());
      }
      long after_mid = (after.start+after.end)/2;
      for (long j= after.start;  j<after_mid;j++) {
        current.hll.addRaw(hash_func.hashLong(j).asLong());
      }
    }
    
    System.out.println("date,hyperloglog");
    for (Container item:items){
      System.out.println(item);
    }

  }

  static class Container {
    public String time;
    public long start;
    public long end;
    public HLL hll;
    public Container(String time, long start, long end) {
      this.time = time;
      this.start = start;
      this.end = end;
      this.hll = new HLL(9,5);
      for(long j=start;j<end;j++){
        hll.addRaw(hash_func.hashLong(j).asLong());
      }
    }
    @Override
    public String toString(){
      return time+"/x"+Hex.encodeHexString(hll.toBytes());
    }
  }
}
