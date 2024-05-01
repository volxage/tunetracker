package com.example.tunetracker;

import android.view.View;
import android.widget.EditText;
import android.widget.SeekBar;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class EditViewHolder extends RecyclerView.ViewHolder {
    TextView keyView;
    View editView;
    public EditViewHolder(@NonNull View itemView) {
        super(itemView);
        keyView = itemView.findViewById(R.id.keylabel);
        editView = itemView.findViewById(R.id.valinput);
    }
    public void setString(String s){
        ((EditText)(editView)).setText(s);
    }
    public void setList(List<String> l){
        ((EditText)(editView)).setText(String.join("\n", l));
    }
    public void setInt(int i){
        ((SeekBar)(editView)).setProgress(i);
    }
}
