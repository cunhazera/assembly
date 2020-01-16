package com.schedule.map;

import com.schedule.entity.Assembly;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class AssemblyMap {

    public List<Assembly> mapFileInputToAssembly() throws URISyntaxException, IOException {
        Path input = Paths.get(getClass().getClassLoader().getResource("input.txt").toURI());
        List<Assembly> assemblies = Files.readAllLines(input).stream()
                .map(e -> {
                    if (!e.endsWith("min")) {
                        return new Assembly(e, 5);
                    } else {
                        String assemblyTitle = e.substring(0, e.length() - 6);
                        Integer minutes = Integer.valueOf(e.substring(e.lastIndexOf(" ") + 1, e.length() - 3));
                        return new Assembly(assemblyTitle, minutes);
                    }
                }).collect(Collectors.toList());
        //Collections.sort(assemblies, Comparator.comparing(Assembly::getMinutes).reversed());
        return assemblies;
    }

}
