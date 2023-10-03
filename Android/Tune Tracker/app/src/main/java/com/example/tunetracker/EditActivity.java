package com.example.tunetracker;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.io.Serializable;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EditActivity extends AppCompatActivity {
    Map<String, Object> tune_map;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        Intent intent = getIntent();
        // Intent to return to MainActivity
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
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                updateValues(recyclerView, myAdapter);
                main_intent.putExtra("name", (Serializable) tune_map);
                startActivity(main_intent);
            }
        });
    }
    void updateValues(RecyclerView recyclerView, EditListAdapter editListAdapter){
        for(int i = 0; i < editListAdapter.getItemCount(); i++){
            EditViewHolder vh = (EditViewHolder) recyclerView.findViewHolderForAdapterPosition(i);
            if(vh == null){
                //TODO: Get correct item count so this isn't necessary
                //Log.e("NULL", "View-holder at " + i + "is null");
            }
            else{
                TextView key_view = vh.keyView;
                String key = key_view.getText().toString();
                int layout = editListAdapter.getItemViewType(i);
                if(layout == R.layout.int_input_view){
                    int val = vh.getInt();
                    Object pre_cast = tune_map.get(key);
                    int post_cast = 0;
                    if(pre_cast != null){
                        post_cast = (int) pre_cast;
                    }
                    if(val != post_cast){
                        tune_map.put(key, val);
                        Log.i("INFO", "Setting val " + val + "for key " + key);
                    }
                }
                else if(layout == R.layout.list_input_view){
                    List<String> val = vh.getList();
                    Object pre_cast = tune_map.get(key);
                    List<String> post_cast;
                    if(pre_cast != null){
                        post_cast = (List<String>)pre_cast;
                    }else{
                        post_cast = new ArrayList<>();
                    }
                    if(!val.equals(post_cast)){
                        tune_map.put(key, val);
                        Log.i("INFO", "Setting val " + val + "for key " + key);
                    }
                }
                else if(layout == R.layout.string_input_view){
                    String val = vh.getString();
                    Object pre_cast = tune_map.get(key);
                    String post_cast = "";
                    if(pre_cast != null){
                        post_cast = (String) pre_cast;
                    }
                    if(!val.equals(post_cast)){
                        tune_map.put(key, val);
                        Log.i("INFO", "Setting val " + val + "for key " + key);
                    }
                }
                Log.i("Edit key ", key);
            }
        }
    }
}
