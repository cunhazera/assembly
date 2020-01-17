package com.schedule.business;

import com.schedule.entity.Assembly;
import com.schedule.map.AssemblyMap;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

public class AssemblyScheduler {

    private static final double DAY_MAXIMUM_MINUTES = 420;
    private SimpleDateFormat simpleDateFormat = new SimpleDateFormat("HH:mm");

    public List<String> createProductionLines() throws IOException, URISyntaxException {
        List<String> productionLines = new ArrayList<>();
        List<Assembly> assemblies = new AssemblyMap().mapFileInputToAssembly();
        int lines = numberOfLines(assemblies);
        int lastIndex = 0;
        for (int i = 0; i < lines; i++) {
            Calendar startTime = timeInstance(9);
            productionLines.add(String.format("Linha de montagem %d", i + 1));
            lastIndex = addProductionLine(productionLines, assemblies, lastIndex, startTime);
        }
        return productionLines;
    }

    private int numberOfLines(List<Assembly> assemblies) {
        Double totalTime = assemblies.stream().map(e -> e.getMinutes()).reduce(0, Integer::sum).doubleValue();
        return new BigDecimal(totalTime / DAY_MAXIMUM_MINUTES).setScale(0, RoundingMode.UP).intValue();
    }

    private int addProductionLine(List<String> productionLines, List<Assembly> assemblies, int lastIndex, Calendar startTime) throws IOException {
        Calendar fiveAfternoon = timeInstance(17);
        for (int j = lastIndex; j < assemblies.size(); j++) {
            lastIndex = j;
            Assembly assembly = assemblies.get(lastIndex);
            Calendar temp = (Calendar) startTime.clone();
            temp.add(Calendar.MINUTE, assembly.getMinutes());
            if (startTime.getTime().before(fiveAfternoon.getTime()) && temp.getTime().before(fiveAfternoon.getTime())) {
                productionLines.add(String.format("%s %s", simpleDateFormat.format(startTime.getTime()), assembly.getName()));
                startTime.add(Calendar.MINUTE, assembly.getMinutes());
                startTime = addLunchTime(productionLines, startTime);
            } else {
                break;
            }
        }
        productionLines.add(String.format("%s %s", simpleDateFormat.format(startTime.getTime()), "Ginastica Laboral"));
        return lastIndex;
    }

    private Calendar addLunchTime(List<String> productionLines, Calendar startTime) {
        if (startTime.get(Calendar.HOUR_OF_DAY) == 12) {
            productionLines.add(String.format("%s %s", simpleDateFormat.format(timeInstance(12).getTime()), "Almoço"));
            startTime = timeInstance(13);
        }
        return startTime;
    }

    private Calendar timeInstance(int hourOfDay) {
        Calendar instance = Calendar.getInstance();
        instance.set(Calendar.HOUR_OF_DAY, hourOfDay);
        instance.set(Calendar.MINUTE, 0);
        instance.set(Calendar.SECOND, 0);
        return instance;
    }

}
