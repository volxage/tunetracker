package com.example.tunetracker;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EditActivity extends AppCompatActivity {
    Map<String, Object> tune_map;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        Intent intent = getIntent();
        Intent main_intent = new Intent(this, MainActivity.class);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.fragment_slideshow);
        tune_map = (HashMap<String, Object>) intent.getSerializableExtra("tune_map");
        setContentView(R.layout.fragment_slideshow);
        RecyclerView recyclerView = findViewById(R.id.editrecycler);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        EditListAdapter myAdapter = new EditListAdapter(getApplicationContext(), tune_map);
        recyclerView.setAdapter(myAdapter);
        Button discardButton = findViewById(R.id.editdiscardbutton);
        discardButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                startActivity(main_intent);
            }
        });
        Button saveButton = findViewById(R.id.editsavebutton);
    }
    void updateValues(){
        for(String key: tune_map.keySet()){
            switch(MainActivity.tuneTypeMap.get(key)){

            }
        }
    }
}
