package com.bousala.ouloum;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // السماح بتشغيل الفيديو الافتتاحي بالصوت تلقائيًا دون انتظار لمسة أولى
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
  }
}
