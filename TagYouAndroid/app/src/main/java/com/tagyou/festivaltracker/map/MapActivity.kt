package com.tagyou.festivaltracker.map

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModelProvider
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.data.FirebaseClient
import com.tagyou.festivaltracker.databinding.ActivityMapBinding
import com.tagyou.festivaltracker.services.LocationTrackingService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.concurrent.TimeUnit

class MapActivity : AppCompatActivity(), OnMapReadyCallback {
    
    private lateinit var binding: ActivityMapBinding
    private lateinit var viewModel: MapViewModel
    private lateinit var map: GoogleMap
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    
    // Location tracking
    private var currentLocation: Location? = null
    private var locationCallback: LocationCallback? = null
    private var locationRequest: LocationRequest? = null
    
    // Firebase listeners
    private var friendsListener: ListenerRegistration? = null
    private var groupsListener: ListenerRegistration? = null
    private var foodStallsListener: ListenerRegistration? = null
    private var floatTrucksListener: ListenerRegistration? = null
    
    // Map markers
    private val friendMarkers = mutableMapOf<String, Marker>()
    private val groupMarkers = mutableMapOf<String, Marker>()
    private val foodStallMarkers = mutableMapOf<String, Marker>()
    private val floatTruckMarkers = mutableMapOf<String, Marker>()
    
    // UI state
    private var showFriends = true
    private var showFoodStalls = false
    private var showFloatTrucks = false
    
    // Permission launcher
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val locationGranted = permissions.entries.all { it.value }
        if (locationGranted) {
            startLocationUpdates()
        } else {
            Toast.makeText(this, "Location permission required for full functionality", Toast.LENGTH_LONG).show()
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMapBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[MapViewModel::class.java]
        
        // Initialize location services
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        // Setup map
        val mapFragment = supportFragmentManager.findFragmentById(R.id.map) as SupportMapFragment
        mapFragment.getMapAsync(this)
        
        // Setup UI
        setupUI()
        
        // Check permissions
        checkLocationPermission()
    }
    
    private fun setupUI() {
        // Status updates
        binding.tvStatus.text = "Initializing map..."
        
        // My location button
        binding.btnMyLocation.setOnClickListener {
            currentLocation?.let { location ->
                val latLng = LatLng(location.latitude, location.longitude)
                map.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15f))
            }
        }
        
        // Center group button
        binding.btnCenterGroup.setOnClickListener {
            centerOnGroup()
        }
        
        // Settings button
        binding.btnSettings.setOnClickListener {
            // TODO: Open map settings
            Toast.makeText(this, "Map settings coming soon", Toast.LENGTH_SHORT).show()
        }
        
        // Control buttons
        binding.btnToggleFriends.setOnClickListener {
            toggleFriendsVisibility()
        }
        
        binding.btnShowFoodStalls.setOnClickListener {
            toggleFoodStallsVisibility()
        }
        
        binding.btnShowFloatTrucks.setOnClickListener {
            toggleFloatTrucksVisibility()
        }
    }
    
    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        map.uiSettings.isZoomControlsEnabled = true
        map.uiSettings.isCompassEnabled = true
        map.uiSettings.isMyLocationButtonEnabled = false // We have custom button
        
        // Set default location (San Francisco)
        val defaultLocation = LatLng(37.7749, -122.4194)
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 12f))
        
        // Update status
        binding.tvStatus.text = "Map ready"
        
        // Start location updates if permission granted
        if (hasLocationPermission()) {
            startLocationUpdates()
        }
        
        // Start real-time data listeners
        startRealtimeListeners()
    }
    
    private fun checkLocationPermission() {
        if (!hasLocationPermission()) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }
    
    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun startLocationUpdates() {
        if (!hasLocationPermission()) return
        
        try {
            // Enable my location on map
            map.isMyLocationEnabled = true
            
            // Create location request
            locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000)
                .setMinUpdateDistanceMeters(10f)
                .setMaxUpdates(5)
                .build()
            
            // Create location callback
            locationCallback = object : LocationCallback() {
                override fun onLocationResult(locationResult: LocationResult) {
                    locationResult.lastLocation?.let { location ->
                        currentLocation = location
                        updateUserLocation(location)
                        binding.tvStatus.text = "Location updated"
                    }
                }
            }
            
            // Start location updates
            fusedLocationClient.requestLocationUpdates(
                locationRequest!!,
                locationCallback!!,
                mainLooper
            )
            
            binding.tvStatus.text = "Location tracking active"
            
        } catch (e: SecurityException) {
            Log.e("MapActivity", "Location permission not granted", e)
            binding.tvStatus.text = "Location permission required"
        }
    }
    
    private fun updateUserLocation(location: Location) {
        val userId = FirebaseAuth.getInstance().currentUser?.uid ?: return
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Update user location in Firestore
                val locationData = hashMapOf(
                    "user_id" to userId,
                    "latitude" to location.latitude,
                    "longitude" to location.longitude,
                    "timestamp" to System.currentTimeMillis(),
                    "accuracy" to location.accuracy
                )
                
                FirebaseClient.Database.getUserLocationDoc(userId)
                    .set(locationData)
                    .await()
                
                Log.d("MapActivity", "Location updated: ${location.latitude}, ${location.longitude}")
                
            } catch (e: Exception) {
                Log.e("MapActivity", "Error updating location", e)
            }
        }
    }
    
    private fun startRealtimeListeners() {
        val userId = FirebaseAuth.getInstance().currentUser?.uid ?: return
        
        // Listen for friends' locations
        friendsListener = FirebaseClient.Database.getUserLocations()
            .whereNotEqualTo("user_id", userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("MapActivity", "Error listening to friends", error)
                    return@addSnapshotListener
                }
                
                snapshot?.documents?.forEach { doc ->
                    val friendId = doc.getString("user_id") ?: return@forEach
                    val latitude = doc.getDouble("latitude") ?: return@forEach
                    val longitude = doc.getDouble("longitude") ?: return@forEach
                    val timestamp = doc.getLong("timestamp") ?: return@forEach
                    
                    updateFriendMarker(friendId, LatLng(latitude, longitude), timestamp)
                }
            }
        
        // Listen for food stalls
        foodStallsListener = FirebaseClient.Database.getFoodStalls()
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("MapActivity", "Error listening to food stalls", error)
                    return@addSnapshotListener
                }
                
                snapshot?.documents?.forEach { doc ->
                    val stallId = doc.id
                    val latitude = doc.getDouble("latitude") ?: return@forEach
                    val longitude = doc.getDouble("longitude") ?: return@forEach
                    val name = doc.getString("name") ?: "Food Stall"
                    
                    updateFoodStallMarker(stallId, LatLng(latitude, longitude), name)
                }
            }
        
        // Listen for float trucks
        floatTrucksListener = FirebaseClient.Database.getFloatTrucks()
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("MapActivity", "Error listening to float trucks", error)
                    return@addSnapshotListener
                }
                
                snapshot?.documents?.forEach { doc ->
                    val truckId = doc.id
                    val latitude = doc.getDouble("latitude") ?: return@forEach
                    val longitude = doc.getDouble("longitude") ?: return@forEach
                    val name = doc.getString("name") ?: "Float Truck"
                    
                    updateFloatTruckMarker(truckId, LatLng(latitude, longitude), name)
                }
            }
    }
    
    private fun updateFriendMarker(friendId: String, position: LatLng, timestamp: Long) {
        if (!showFriends) return
        
        val marker = friendMarkers[friendId]
        if (marker != null) {
            marker.position = position
        } else {
            val newMarker = map.addMarker(
                MarkerOptions()
                    .position(position)
                    .title("Friend")
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE))
            )
            friendMarkers[friendId] = newMarker!!
        }
    }
    
    private fun updateFoodStallMarker(stallId: String, position: LatLng, name: String) {
        if (!showFoodStalls) return
        
        val marker = foodStallMarkers[stallId]
        if (marker != null) {
            marker.position = position
        } else {
            val newMarker = map.addMarker(
                MarkerOptions()
                    .position(position)
                    .title(name)
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ORANGE))
            )
            foodStallMarkers[stallId] = newMarker!!
        }
    }
    
    private fun updateFloatTruckMarker(truckId: String, position: LatLng, name: String) {
        if (!showFloatTrucks) return
        
        val marker = floatTruckMarkers[truckId]
        if (marker != null) {
            marker.position = position
        } else {
            val newMarker = map.addMarker(
                MarkerOptions()
                    .position(position)
                    .title(name)
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN))
            )
            floatTruckMarkers[truckId] = newMarker!!
        }
    }
    
    private fun toggleFriendsVisibility() {
        showFriends = !showFriends
        binding.btnToggleFriends.text = if (showFriends) getString(R.string.hide_friends) else getString(R.string.show_friends)
        
        friendMarkers.values.forEach { marker ->
            marker.isVisible = showFriends
        }
    }
    
    private fun toggleFoodStallsVisibility() {
        showFoodStalls = !showFoodStalls
        binding.btnShowFoodStalls.text = if (showFoodStalls) getString(R.string.hide_food_stalls) else getString(R.string.show_food_stalls)
        
        foodStallMarkers.values.forEach { marker ->
            marker.isVisible = showFoodStalls
        }
    }
    
    private fun toggleFloatTrucksVisibility() {
        showFloatTrucks = !showFloatTrucks
        binding.btnShowFloatTrucks.text = if (showFloatTrucks) getString(R.string.hide_float_trucks) else getString(R.string.show_float_trucks)
        
        floatTruckMarkers.values.forEach { marker ->
            marker.isVisible = showFloatTrucks
        }
    }
    
    private fun centerOnGroup() {
        // TODO: Implement group centering logic
        Toast.makeText(this, "Centering on group...", Toast.LENGTH_SHORT).show()
    }
    
    override fun onDestroy() {
        super.onDestroy()
        
        // Stop location updates
        locationCallback?.let { callback ->
            fusedLocationClient.removeLocationUpdates(callback)
        }
        
        // Remove Firebase listeners
        friendsListener?.remove()
        groupsListener?.remove()
        foodStallsListener?.remove()
        floatTrucksListener?.remove()
    }
}
