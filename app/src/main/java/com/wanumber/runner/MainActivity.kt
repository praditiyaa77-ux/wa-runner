package com.wanumber.runner

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val prefs by lazy { getSharedPreferences("wa_runner_store", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()
        webView.addJavascriptInterface(AppBridge(), "AndroidBridge")
        setContentView(webView)
        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class AppBridge {
        @JavascriptInterface
        fun loadNumbers(): String {
            return prefs.getString("numbers_json", "[]") ?: "[]"
        }

        @JavascriptInterface
        fun saveNumbers(json: String): Boolean {
            return try {
                // Validate that the payload is a JSON array before persisting it.
                JSONArray(json)
                prefs.edit().putString("numbers_json", json).apply()
                true
            } catch (_: Exception) {
                false
            }
        }

        @JavascriptInterface
        fun openWhatsApp(rawNumber: String): Boolean {
            val number = rawNumber.filter { it.isDigit() }
            if (number.length < 7 || number.length > 15) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Format nomor tidak valid", Toast.LENGTH_SHORT).show()
                }
                return false
            }
            return try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$number"))
                startActivity(intent)
                true
            } catch (_: Exception) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Tidak dapat membuka WhatsApp atau browser", Toast.LENGTH_SHORT).show()
                }
                false
            }
        }

        @JavascriptInterface
        fun showToast(message: String) {
            runOnUiThread {
                Toast.makeText(this@MainActivity, message.take(120), Toast.LENGTH_SHORT).show()
            }
        }
    }

    @Deprecated("Deprecated in Android API")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }
}
