package com.tagyou.festivaltracker.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.map.MapActivity

class TagYouFirebaseMessagingService : FirebaseMessagingService() {
    
    companion object {
        private const val CHANNEL_ID = "tagyou_channel"
        private const val CHANNEL_NAME = "TagYou Notifications"
        private const val CHANNEL_DESCRIPTION = "Notifications from TagYou app"
    }
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Handle notification when app is in foreground
        remoteMessage.notification?.let { notification ->
            showNotification(
                title = notification.title ?: "TagYou",
                body = notification.body ?: "",
                data = remoteMessage.data
            )
        }
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Send token to server
        sendTokenToServer(token)
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                enableVibration(true)
            }
            
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val intent = Intent(this, MapActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            // Add any data extras here
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_my_location)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
    
    private fun sendTokenToServer(token: String) {
        // TODO: Send token to your server for push notifications
        // This would typically involve sending the token to your backend
        // so you can send targeted notifications to specific users
    }
}

