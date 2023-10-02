package com.example.tunetracker;

import android.view.View;
import android.widget.EditText;
import android.widget.SeekBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.lang.reflect.Type;
import java.util.Arrays;
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
        EditText et = ((EditText)(editView));
        et.setText(s);
    }
    public void setList(List<String> l){
        EditText et = ((EditText)(editView));
        et.setText(String.join("\n", l));
    }
    public void setInt(int i) {
        SeekBar sb = ((SeekBar) (editView));
        sb.setProgress(i);
    }
    public String getString(){
        EditText et = ((EditText) (editView));
        return et.getText().toString();
    }
    public List<String> getList(){
        EditText et = (EditText) editView;
        return Arrays.asList(et.getText().toString().split("\n"));
    }
    public int getInt(){
        SeekBar sb = (SeekBar) editView;
        return sb.getProgress();
    }
}
