package com.example.tunetracker;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.res.AssetManager;
import android.os.Bundle;
import android.util.JsonReader;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentContainerView;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity{
    public static final Map<String, String> tuneTypeMap = new LinkedHashMap<>();
    static {
        tuneTypeMap.put("title", "String");
        tuneTypeMap.put("alternative_title", "String");
        tuneTypeMap.put("composers", "List");
        tuneTypeMap.put("form", "String");
        tuneTypeMap.put("notable_recordings", "List");
        tuneTypeMap.put("keys", "List");
        tuneTypeMap.put("styles", "List");
        tuneTypeMap.put("tempi", "List");
        tuneTypeMap.put("contrafacts", "List");
        tuneTypeMap.put("playthroughs", "int");
        tuneTypeMap.put("form_confidence", "int");
        tuneTypeMap.put("melody_confidence", "int");
        tuneTypeMap.put("solo_confidence", "int");
        tuneTypeMap.put("lyrics_confidence", "int");
        tuneTypeMap.put("played_at", "List");
    }
    private static final Map<String, String> spinnerTranslationMap = new HashMap<>();
    static {
        spinnerTranslationMap.put("Title", "title");
        spinnerTranslationMap.put("Alternative title", "alternative_title");
        spinnerTranslationMap.put("Composer(s)", "composers");
        spinnerTranslationMap.put("Form", "form");
        spinnerTranslationMap.put("Notable recordings", "notable_recordings");
        spinnerTranslationMap.put("Keys", "keys");
        spinnerTranslationMap.put("Styles", "styles");
        spinnerTranslationMap.put("Tempi", "tempi");
        spinnerTranslationMap.put("Contrafacts", "contrafacts");
        spinnerTranslationMap.put("Playthroughs", "playthroughs");
        spinnerTranslationMap.put("Form confidence", "form_confidence");
        spinnerTranslationMap.put("Melody confidence", "melody_confidence");
        spinnerTranslationMap.put("Solo confidence", "solo_confidence");
        spinnerTranslationMap.put("Lyrics confidence", "lyrics_confidence");
        spinnerTranslationMap.put("Played at", "played_at");
    }
    ArrayList<Tune> tunelist = new ArrayList<>();
    private AppBarConfiguration mAppBarConfiguration;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        setContentView(R.layout.fragment_home);

        AssetManager assetManager = getAssets();
        try{
            InputStream inputStream = assetManager.open("songs.json");
            ArrayList<HashMap<String, Object>> array = this.parseJson(inputStream);
            inputStream.close();
            for(HashMap<String,Object> m : array){
                Tune tmptune = new Tune(m);
                tunelist.add(tmptune);
            }
        }catch(IOException exception){
            Log.e("Test Err", exception.getMessage());
        }
        RecyclerView recyclerView = findViewById(R.id.recyclerview);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        MyAdapter myAdapter = new MyAdapter(this, this.tunelist);
        recyclerView.setAdapter(myAdapter);


        Spinner spinner = (Spinner) findViewById(R.id.spinner);
        ArrayAdapter<CharSequence> arrayAdapter = ArrayAdapter.createFromResource(this, R.array.sort_keys, android.R.layout.simple_spinner_item);
        arrayAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(arrayAdapter);

        final Button sort_button = findViewById(R.id.sortbutton);
        sort_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.i("Info", spinner.getSelectedItem().toString());
                myAdapter.sort(spinnerTranslationMap.get(spinner.getSelectedItem()));
            }
        });
        final Button edit_button = findViewById(R.id.editbutton);
        edit_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                switchActivity();
            }
        });
    }
    public void switchActivity(){
        Intent i = new Intent(this, EditActivity.class);
        Map<String, Object> tn = tunelist.get(0).map;
        i.putExtra("tune_map", tunelist.get(0).map);
        startActivity(i);
    }
    private HashMap<String, Object> parseJsonTune(JsonReader jsonReader){
        HashMap<String, Object> map = new HashMap<>();
        try {
            while(jsonReader.hasNext()){
                String key = jsonReader.nextName();
                switch(tuneTypeMap.get(key)){
                    case "String":
                        map.put(key, jsonReader.nextString());
                        break;
                    case "int":
                        map.put(key, jsonReader.nextInt());
                        break;
                    case "List":
                        jsonReader.beginArray();
                        ArrayList<String> l = new ArrayList<>();
                        while(jsonReader.hasNext()){
                            l.add(jsonReader.nextString());
                        }
                        jsonReader.endArray();
                        map.put(key, l);
                        break;
                    default:
                        jsonReader.skipValue();
                }
            }
        }catch(Exception e){
            Log.e("Exception", e.getMessage());
        }
        return map;
    }
    private ArrayList<HashMap<String, Object>> parseJson(InputStream inputStream){
        ArrayList<HashMap<String, Object>> tunelist = new ArrayList<>();
        try {
            InputStreamReader in_strm = new InputStreamReader(inputStream);
            JsonReader jsonReader = new JsonReader(in_strm);
            jsonReader.beginArray();
            while(jsonReader.hasNext()){
                jsonReader.beginObject();
                tunelist.add(this.parseJsonTune(jsonReader));
                jsonReader.endObject();
            }
            jsonReader.endArray();
            in_strm.close();
        }catch(IOException ioe){
            Log.e("IOException", ioe.getMessage());
        }
        Log.i("Completed tunelist", tunelist.toString());
        return tunelist;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

}